import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, DollarSign, Clock, MessageSquare, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AuditEvent {
  id: string;
  type: 'status_change' | 'message' | 'dispute';
  timestamp: string;
  user_email: string;
  details: string;
  status?: string;
}

interface DealAuditTrailProps {
  dealId: string;
  currentStatus: string;
  buyerEmail: string;
  sellerEmail: string;
}

const DealAuditTrail: React.FC<DealAuditTrailProps> = ({ dealId, currentStatus, buyerEmail, sellerEmail }) => {
  const [events, setEvents] = React.useState<AuditEvent[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchAuditEvents();
  }, [dealId]);

  const fetchAuditEvents = async () => {
    setLoading(true);
    try {
      // Fetch status changes
      const { data: statusChangesRaw, error: statusError } = await supabase
        .from('deals')
        .select('status, updated_at, dispute_reason, disputed_at, resolved_at, resolution_note')
        .eq('id', dealId)
        .order('updated_at', { ascending: true });

      if (statusError) throw statusError;
      let statusChanges: Array<{
        status: string;
        updated_at: string;
        dispute_reason?: string | null;
        disputed_at?: string | null;
        resolved_at?: string | null;
        resolution_note?: string | null;
      }> = [];
      if (Array.isArray(statusChangesRaw) && statusChangesRaw.length > 0 && 'status' in statusChangesRaw[0]) {
        statusChanges = statusChangesRaw as any;
      }

      // Fetch messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Combine and format events
      const auditEvents: AuditEvent[] = [
        // Initial status
        {
          id: 'initial',
          type: 'status_change' as const,
          timestamp: statusChanges[0]?.updated_at || new Date().toISOString(),
          user_email: buyerEmail,
          details: 'Deal created',
          status: 'pending'
        },
        // Status changes
        ...statusChanges.map((change, index): AuditEvent => ({
          id: `status-${index}`,
          type: 'status_change' as const,
          timestamp: change.updated_at,
          user_email: change.status === 'paid' ? buyerEmail : sellerEmail,
          details: `Deal marked as ${change.status}`,
          status: change.status
        })),
        // Dispute event (if present)
        ...(statusChanges[0]?.status === 'disputed' && (statusChanges[0]?.disputed_at || statusChanges[0]?.dispute_reason) ? [{
          id: 'dispute',
          type: 'dispute' as const,
          timestamp: statusChanges[0]?.disputed_at || statusChanges[0]?.updated_at || new Date().toISOString(),
          user_email: buyerEmail || sellerEmail,
          details: `Dispute filed${statusChanges[0]?.dispute_reason ? ': ' + statusChanges[0].dispute_reason : ''}`
        }] : []),
        // Resolution event (if present)
        ...(statusChanges[0]?.status === 'resolved' && statusChanges[0]?.resolved_at ? [{
          id: 'resolved',
          type: 'status_change' as const,
          timestamp: statusChanges[0].resolved_at,
          user_email: 'Admin',
          details: `Dispute resolved${statusChanges[0]?.resolution_note ? ': ' + statusChanges[0].resolution_note : ''}`,
          status: 'resolved'
        }] : []),
        // Messages
        ...messages.map((msg): AuditEvent => ({
          id: msg.id,
          type: 'message' as const,
          timestamp: msg.created_at,
          user_email: msg.sender_email,
          details: msg.message
        }))
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      setEvents(auditEvents);
    } catch (error) {
      console.error('Error fetching audit events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (event: AuditEvent) => {
    switch (event.type) {
      case 'status_change':
        switch (event.status) {
          case 'pending':
            return <Clock className="w-4 h-4" />;
          case 'paid':
            return <DollarSign className="w-4 h-4" />;
          case 'complete':
            return <CheckCircle className="w-4 h-4" />;
          default:
            return <Clock className="w-4 h-4" />;
        }
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'dispute':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getEventColor = (event: AuditEvent) => {
    switch (event.type) {
      case 'status_change':
        switch (event.status) {
          case 'pending':
            return 'text-yellow-500';
          case 'paid':
            return 'text-blue-500';
          case 'complete':
            return 'text-green-500';
          default:
            return 'text-gray-500';
        }
      case 'message':
        return 'text-gray-500';
      case 'dispute':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <Card className="mt-8 mb-4">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-8 w-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 mb-4" aria-label="Deal Timeline" role="region">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-6 text-lg">Deal Timeline</h3>
        {events.length === 0 ? (
          <div className="text-center text-muted-foreground py-8" aria-live="polite">
            No timeline events yet. Actions and messages will appear here.
          </div>
        ) : (
          <div className="space-y-8">
            {events.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(event)} bg-muted/40`}>
                    {getEventIcon(event)}
                  </div>
                  {index < events.length - 1 && (
                    <div className="w-0.5 h-full bg-muted my-2"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{event.user_email === buyerEmail ? 'Buyer' : 'Seller'}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DealAuditTrail; 