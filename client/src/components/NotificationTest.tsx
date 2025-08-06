import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function NotificationTest() {
  const { toast } = useToast();

  const testNotifications = () => {
    // Test different types of notifications
    toast({
      title: "Success Notification",
      description: "This is a success notification test.",
      variant: "default",
    });

    setTimeout(() => {
      toast({
        title: "Error Notification", 
        description: "This is an error notification test.",
        variant: "destructive",
      });
    }, 1000);

    setTimeout(() => {
      toast({
        title: "Info Notification",
        description: "This is an information notification test.",
        variant: "default",
      });
    }, 2000);
  };

  return (
    <div className="p-4">
      <Button onClick={testNotifications}>
        Test Notifications
      </Button>
    </div>
  );
}