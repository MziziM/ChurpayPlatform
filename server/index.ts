import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { protectCoreEndpoints, validateFeeStructure } from "./codeProtection";

// Security-first logger configuration
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname'
    }
  } : undefined,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type']
      }
    }),
    res: (res) => ({
      statusCode: res.statusCode
    })
  }
});

const app = express();

// Security headers and CORS configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || false
    : ['http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request logging middleware
app.use(pinoHttp({ logger }));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    return req.url === '/health' || 
           req.url?.startsWith('/assets/') || 
           req.url?.startsWith('/public/');
  }
});

app.use(globalLimiter);

// Body parsing with security limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for PayFast signature verification
    if (req.url === '/api/payfast/notify') {
      (req as any).rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ 
  extended: false, 
  limit: '10mb' 
}));

// Session configuration for super admin auth with enhanced security
app.use(session({
  secret: process.env.SESSION_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET must be set in production');
    }
    return 'churpay-session-secret-key-dev';
  })(),
  name: 'churpay.sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Require HTTPS in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  },
  rolling: true // Reset expiration on activity
}));

// Health check endpoint (before protection middleware)
app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

// Initialize code protection system
logger.info("🔒 ChurPay Code Protection System Active");
logger.info("   Core files are locked against unauthorized modifications");
if (!validateFeeStructure()) {
  logger.error("❌ CRITICAL: Fee structure has been tampered with!");
  process.exit(1);
}
logger.info("✅ Fee structure validated: 3.9% + R3 per transaction");
logger.info("   Only explicitly requested changes permitted");

// Apply core endpoint protection
app.use(protectCoreEndpoints);

// Custom request logging for API endpoints
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.url;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Error handling with security considerations
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error details securely
  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent']
      }
    },
    status
  }, 'Request error');

  // In production, don't expose sensitive error details
  const responseMessage = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal Server Error'
    : message;

  res.status(status).json({ 
    error: responseMessage,
    timestamp: new Date().toISOString(),
    path: req.url
  });
};

(async () => {
  try {
    const server = await registerRoutes(app);

    // Global error handler (must be last)
    app.use(errorHandler);

    // Setup development or production serving
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start server with enhanced configuration
    const port = parseInt(process.env.PORT || '5000', 10);
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      logger.info(`🚀 ChurPay server running on port ${port}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔐 Security headers enabled`);
      logger.info(`📝 Request logging active`);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
})();