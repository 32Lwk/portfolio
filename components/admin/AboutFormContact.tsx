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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContactData } from "@/lib/contact";
import { CONTACT_ICONS } from "@/lib/about-constants";
import { Plus, Trash2 } from "lucide-react";

interface AboutFormContactProps {
  data: ContactData;
  onChange: (data: ContactData) => void;
}

export function AboutFormContact({ data, onChange }: AboutFormContactProps) {
  const links = data.socialLinks ?? [];

  const addLink = () => {
    onChange({
      ...data,
      socialLinks: [...links, { name: "", href: "", icon: "Github" }],
    });
  };

  const updateLink = (index: number, upd: Partial<ContactData["socialLinks"][number]>) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], ...upd };
    onChange({ ...data, socialLinks: newLinks });
  };

  const removeLink = (index: number) => {
    onChange({
      ...data,
      socialLinks: links.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label>SNS・連絡先</Label>
        <Button type="button" variant="outline" size="sm" onClick={addLink}>
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
      </div>
      <Accordion type="multiple" defaultValue={links.map((_, i) => `link-${i}`)} className="space-y-1">
        {links.map((link, index) => (
          <AccordionItem key={index} value={`link-${index}`} className="rounded-lg border px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center justify-between pr-2">
                <span className="font-medium">
                  項目 {index + 1}
                  {link.name && (
                    <span className="ml-2 text-muted-foreground">— {link.name}</span>
                  )}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLink(index);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2 pb-2 sm:flex-row sm:items-end sm:gap-4">
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-xs">名前</Label>
                <Input
                  value={link.name}
                  onChange={(e) => updateLink(index, { name: e.target.value })}
                  placeholder="GitHub"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">URL</Label>
                <Input
                  value={link.href}
                  onChange={(e) => updateLink(index, { href: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label className="text-xs">アイコン</Label>
                <Select
                  value={link.icon}
                  onValueChange={(v) => updateLink(index, { icon: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_ICONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">その他（新規）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="grid gap-2">
        <Label>問い合わせフォームURL</Label>
        <Input
          value={data.formUrl ?? ""}
          onChange={(e) => onChange({ ...data, formUrl: e.target.value })}
          placeholder="https://forms.gle/..."
        />
      </div>
    </div>
  );
}
