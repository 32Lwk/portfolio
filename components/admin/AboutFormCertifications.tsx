"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2 } from "lucide-react";

interface AboutFormCertificationsProps {
  items: string[];
  onChange: (items: string[]) => void;
}

export function AboutFormCertifications({
  items,
  onChange,
}: AboutFormCertificationsProps) {
  const addItem = () => {
    onChange([...items, ""]);
  };

  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label>資格一覧</Label>
      <Accordion type="multiple" defaultValue={items.map((_, i) => `cert-${i}`)} className="space-y-1">
        {items.map((item, index) => (
          <AccordionItem key={index} value={`cert-${index}`} className="rounded-lg border px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center justify-between pr-2">
                <span className="font-medium">
                  資格 {index + 1}
                  {item && (
                    <span className="ml-2 text-muted-foreground">— {item}</span>
                  )}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(index);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-2">
                <Input
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder="例: 基本情報技術者試験"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button type="button" variant="outline" onClick={addItem}>
        <Plus className="mr-1 h-4 w-4" />
        資格を追加
      </Button>
    </div>
  );
}
