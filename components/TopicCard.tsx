'use client';

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import TopicModal from "./TopicModal";

type Topic = {
  id: number;
  title: string;
  date: string;
};

type TopicCardProps = {
  topic: Topic;
};

export default function TopicCard({ topic }: TopicCardProps) {
  const [open, setOpen] = useState(false);
  
  // Format the date to show how long ago it was posted
  const formattedDate = formatDistanceToNow(new Date(topic.date), { addSuffix: true });
  
  return (
    <>
      <Card 
        className="cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-md" 
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-6">
          <div className="mb-4">
            <Badge variant="outline" className="mb-2">Discussion</Badge>
            <h3 className="font-bold text-xl mb-2 line-clamp-2">{topic.title}</h3>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-3 bg-muted/30 flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>Comments</span>
          </div>
        </CardFooter>
      </Card>
      
      {open && (
        <TopicModal 
          topic={topic} 
          onClose={() => setOpen(false)} 
        />
      )}
    </>
  );
}