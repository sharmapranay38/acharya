"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Youtube } from "lucide-react";
import Link from "next/link";

const buttonVariant = {
  outline: "outline" as "outline",
  ghost: "ghost" as "ghost",
  link: "link" as "link",
  default: "default" as "default",
  destructive: "destructive" as "destructive",
  secondary: "secondary" as "secondary",
};

interface UploadButtonProps {
  variant?: keyof typeof buttonVariant;
}

export function UploadButton({ variant = "default" }: UploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (type: "file" | "youtube") => {
    // Here you would handle the upload/processing
    console.log(type === "file" ? file : youtubeUrl);
    setIsOpen(false);
    setFile(null);
    setYoutubeUrl("");
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant={buttonVariant[variant]}
        className="h-20 flex flex-col gap-1"
        asChild
      >
        <Link href="/upload?type=file">
          <FileText className="h-6 w-6" />
          <span>Upload Document</span>
        </Link>
      </Button>
      <Button
        variant={buttonVariant[variant]}
        className="h-20 flex flex-col gap-1"
        asChild
      >
        <Link href="/upload?type=youtube">
          <Youtube className="h-6 w-6" />
          <span>YouTube Link</span>
        </Link>
      </Button>
    </div>
  );
}
