import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { motion } from 'framer-motion';
import { 
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  Users,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Heart,
  Music,
  BookOpen,
  Coffee,
  Baby
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'service' | 'meeting' | 'conference' | 'social' | 'outreach' | 'youth' | 'children';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  attendees: number;
  maxAttendees?: number;
  organizer: string;
  requirements: string[];
  notes?: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Sunday Morning Service',
    description: 'Weekly worship service with sermon and communion',
    date: '2024-01-21',
    time: '09:00',
    location: 'Main Sanctuary',
    type: 'service',
    status: 'upcoming',
    attendees: 0,
    maxAttendees: 400,
    organizer: 'Pastor John',
    requirements: ['Sound Tech', 'Ushers', 'Worship Team'],
    notes: 'Special guest speaker this week'
  },
  {
    id: '2',
    title: 'Youth Bible Study',
    description: 'Weekly Bible study for teenagers and young adults',
    date: '2024-01-19',
    time: '19:00',
    location: 'Youth Hall',
    type: 'youth',
    status: 'upcoming',
    attendees: 0,
    maxAttendees: 50,
    organizer: 'Sarah Johnson',
    requirements: ['Youth Leader', 'Snacks'],
    notes: 'Studying the book of Philippians'
  },
  {
    id: '3',
    title: 'Community Outreach',
    description: 'Food distribution and community service',
    date: '2024-01-20',
    time: '10:00',
    location: 'Community Center',
    type: 'outreach',
    status: 'upcoming',
    attendees: 0,
    maxAttendees: 100,
    organizer: 'Mike Wilson',
    requirements: ['Volunteers', 'Transport', 'Food Supplies'],
    notes: 'Need 20 volunteers for food packing'
  },
  {
    id: '4',
    title: 'Prayer Meeting',
    description: 'Mid-week prayer and worship gathering',
    date: '2024-01-17',
    time: '19:30',
    location: 'Prayer Room',
    type: 'meeting',
    status: 'completed',
    attendees: 35,
    maxAttendees: 50,
    organizer: 'Mary Brown',
    requirements: ['Prayer Leader'],
    notes: 'Focused on healing prayers'
  }
];

export function EventManagement() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({});

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const eventStats = {
    total: events.length,
    upcoming: events.filter(e => e.status === 'upcoming').length,
    completed: events.filter(e => e.status === 'completed').length,
    thisWeek: events.filter(e => {
      const eventDate = new Date(e.date);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate >= now && eventDate <= weekFromNow;
    }).length
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service': return 'bg-blue-100 text-blue-800';
      case 'meeting': return 'bg-green-100 text-green-800';
      case 'conference': return 'bg-purple-100 text-purple-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      case 'outreach': return 'bg-orange-100 text-orange-800';
      case 'youth': return 'bg-yellow-100 text-yellow-800';
      case 'children': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service': return BookOpen;
      case 'meeting': return Users;
      case 'conference': return Star;
      case 'social': return Coffee;
      case 'outreach': return Heart;
      case 'youth': return Music;
      case 'children': return Baby;
      default: return Calendar;
    }
  };

  const handleAddEvent = () => {
    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title || '',
      description: newEvent.description || '',
      date: newEvent.date || '',
      time: newEvent.time || '',
      location: newEvent.location || '',
      type: newEvent.type || 'meeting',
      status: 'upcoming',
      attendees: 0,
      maxAttendees: newEvent.maxAttendees,
      organizer: newEvent.organizer || '',
      requirements: [],
      notes: newEvent.notes
    };
    setEvents([event, ...events]);
    setShowAddModal(false);
    setNewEvent({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Event Management
          </h1>
          <p className="text-gray-600">
            Schedule and manage church events and activities
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Events
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Calendar
          </Button>
          <Button 
            size="sm" 
            onClick={() => setShowAddModal(true)}
            className="bg-churpay-gradient text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{eventStats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">{eventStats.upcoming}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-green-600">{eventStats.thisWeek}</p>
            </div>
            <Star className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-600">{eventStats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-gray-500" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-white border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <BookOpen className="w-6 h-6" />
            <span>Sunday Service</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Users className="w-6 h-6" />
            <span>Prayer Meeting</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Heart className="w-6 h-6" />
            <span>Outreach Event</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Music className="w-6 h-6" />
            <span>Youth Meeting</span>
          </Button>
        </div>
      </Card>

      {/* Filters and Search */}
      <Card className="p-6 bg-white border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-md border bg-gray-50 border-gray-200 text-gray-900"
          >
            <option value="all">All Types</option>
            <option value="service">Services</option>
            <option value="meeting">Meetings</option>
            <option value="conference">Conferences</option>
            <option value="social">Social</option>
            <option value="outreach">Outreach</option>
            <option value="youth">Youth</option>
            <option value="children">Children</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-md border bg-gray-50 border-gray-200 text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const IconComponent = getTypeIcon(event.type);
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.organizer}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
              </div>

              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{event.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{event.location}</span>
                </div>
                {event.maxAttendees && (
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {event.attendees}/{event.maxAttendees} attendees
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Badge className={getTypeColor(event.type)}>
                  {event.type}
                </Badge>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Event Detail Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                  {React.createElement(getTypeIcon(selectedEvent.type), { className: "w-8 h-8 text-purple-600" })}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h3>
                  <p className="text-gray-600">{selectedEvent.organizer}</p>
                  <div className="flex space-x-2 mt-1">
                    <Badge className={getTypeColor(selectedEvent.type)}>
                      {selectedEvent.type}
                    </Badge>
                    <Badge className={getStatusColor(selectedEvent.status)}>
                      {selectedEvent.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card className="p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-2">Event Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Date:</span> {selectedEvent.date}</p>
                    <p className="text-sm"><span className="font-medium">Time:</span> {selectedEvent.time}</p>
                    <p className="text-sm"><span className="font-medium">Location:</span> {selectedEvent.location}</p>
                    {selectedEvent.maxAttendees && (
                      <p className="text-sm">
                        <span className="font-medium">Capacity:</span> {selectedEvent.attendees}/{selectedEvent.maxAttendees}
                      </p>
                    )}
                  </div>
                </Card>

                <Card className="p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                  <div className="space-y-1">
                    {selectedEvent.requirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{req}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-700">{selectedEvent.description}</p>
              </Card>

              {selectedEvent.notes && (
                <Card className="p-4 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700">{selectedEvent.notes}</p>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Event Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Create New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Event Title"
              value={newEvent.title || ''}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              className="bg-gray-50 border-gray-200"
            />
            <Textarea
              placeholder="Event Description"
              value={newEvent.description || ''}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              className="bg-gray-50 border-gray-200"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={newEvent.date || ''}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                className="bg-gray-50 border-gray-200"
              />
              <Input
                type="time"
                value={newEvent.time || ''}
                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <Input
              placeholder="Location"
              value={newEvent.location || ''}
              onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              className="bg-gray-50 border-gray-200"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={newEvent.type || 'meeting'}
                onChange={(e) => setNewEvent({...newEvent, type: e.target.value as Event['type']})}
                className="px-3 py-2 rounded-md border bg-gray-50 border-gray-200 text-gray-900"
              >
                <option value="service">Service</option>
                <option value="meeting">Meeting</option>
                <option value="conference">Conference</option>
                <option value="social">Social</option>
                <option value="outreach">Outreach</option>
                <option value="youth">Youth</option>
                <option value="children">Children</option>
              </select>
              <Input
                placeholder="Max Attendees (optional)"
                type="number"
                value={newEvent.maxAttendees || ''}
                onChange={(e) => setNewEvent({...newEvent, maxAttendees: parseInt(e.target.value) || undefined})}
                className="bg-gray-50 border-gray-200"
              />
            </div>
            <Input
              placeholder="Organizer"
              value={newEvent.organizer || ''}
              onChange={(e) => setNewEvent({...newEvent, organizer: e.target.value})}
              className="bg-gray-50 border-gray-200"
            />
            <Textarea
              placeholder="Notes (optional)"
              value={newEvent.notes || ''}
              onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
              className="bg-gray-50 border-gray-200"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEvent} className="bg-churpay-gradient text-white">
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}