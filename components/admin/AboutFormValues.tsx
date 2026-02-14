"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { ValuesData } from "@/lib/values";
import { VALUES_ICONS } from "@/lib/about-constants";

interface AboutFormValuesProps {
  data: ValuesData;
  onChange: (data: ValuesData) => void;
}

export function AboutFormValues({ data, onChange }: AboutFormValuesProps) {
  const updateItem = (
    index: number,
    upd: Partial<ValuesData["items"][number]>
  ) => {
    const items = [...data.items];
    items[index] = { ...items[index], ...upd };
    onChange({ ...data, items });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label>モットー</Label>
        <Input
          value={data.motto}
          onChange={(e) => onChange({ ...data, motto: e.target.value })}
          placeholder="「人や社会に影響を与えるシステムは、誤ってはいけない」"
        />
      </div>
      <div className="grid gap-2">
        <Label>モットー説明</Label>
        <Textarea
          value={data.mottoDescription}
          onChange={(e) => onChange({ ...data, mottoDescription: e.target.value })}
          rows={2}
        />
      </div>
      <div className="space-y-4">
        <Label>価値観の項目</Label>
        <Accordion type="multiple" defaultValue={data.items.map((_, i) => `val-${i}`)} className="space-y-1">
          {data.items.map((item, index) => (
            <AccordionItem key={index} value={`val-${index}`} className="rounded-lg border px-3">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-medium">
                  項目 {index + 1}
                  {item.title && (
                    <span className="ml-2 text-muted-foreground">— {item.title}</span>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pb-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-xs">アイコン</Label>
                <Select
                  value={item.icon}
                  onValueChange={(v) =>
                    updateItem(index, { icon: v as ValuesData["items"][number]["icon"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALUES_ICONS.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">タイトル</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updateItem(index, { title: e.target.value })}
                  placeholder="LLMや人の判断に「丸投げしない」"
                />
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <Label className="text-xs">説明</Label>
              <Textarea
                value={item.description}
                onChange={(e) => updateItem(index, { description: e.target.value })}
                rows={3}
              />
            </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <div className="grid gap-2">
        <Label>キャリア方向性（中期）</Label>
        <Textarea
          value={data.careerShortTerm}
          onChange={(e) => onChange({ ...data, careerShortTerm: e.target.value })}
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label>キャリア方向性（長期）</Label>
        <Textarea
          value={data.careerLongTerm}
          onChange={(e) => onChange({ ...data, careerLongTerm: e.target.value })}
          rows={2}
        />
      </div>
    </div>
  );
}
