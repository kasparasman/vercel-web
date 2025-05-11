import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import useComments from "@/hooks/useComments";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { Send, Loader2, Calendar } from "lucide-react";

type Comment = {
  id: number;
  author_id: string;
  content: string;
  created_at: string;
};

type Topic = {
  id: number;
  title: string;
  date: string;
};

type TopicModalProps = {
  topic: Topic;
  onClose: () => void;
};

export default function TopicModal({ topic, onClose }: TopicModalProps) {
  const { user } = useUser();
  const { comments, addComment, loading } = useComments(topic.id);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Format the date to show how long ago it was posted
  const formattedDate = formatDistanceToNow(new Date(topic.date), { addSuffix: true });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      await addComment(newComment.trim());
      setNewComment("");
    } finally {
      setSubmitting(false);
    }
  };

  // Generate avatar initials from author ID
  const getInitials = (authorId: string) => {
    return authorId.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{topic.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Posted {formattedDate}</span>
          </DialogDescription>
        </DialogHeader>
        
        {/* Topic Content - This would normally be fetched separately */}
        <div className="p-4 bg-muted/30 rounded-md my-4">
          <p>This is a placeholder for the full topic content. In a real application, we would fetch the complete topic details including the main content when opening this modal.</p>
        </div>
        
        <Separator className="my-2" />
        
        <h3 className="font-semibold text-lg mb-2">Comments</h3>
        
        {/* Comments section */}
        <div className="overflow-y-auto flex-grow mb-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment: Comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(comment.author_id)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.author_id}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Comment input */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="mt-auto">
            <div className="flex gap-2">
              <Textarea 
                placeholder="Add a comment..." 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                className="flex-1 resize-none"
                maxLength={500}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!newComment.trim() || submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-muted/30 p-3 rounded text-center text-sm text-muted-foreground">
            You need to sign in to post comments.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}