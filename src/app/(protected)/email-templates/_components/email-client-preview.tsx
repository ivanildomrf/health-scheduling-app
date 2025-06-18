"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Clock,
  Forward,
  MoreHorizontal,
  Paperclip,
  Reply,
  ReplyAll,
  Star,
  Tag,
  Trash2,
} from "lucide-react";

interface EmailClientPreviewProps {
  subject: string;
  htmlContent: string;
  senderName?: string;
  senderEmail?: string;
  recipientEmail?: string;
}

export function EmailClientPreview({
  subject,
  htmlContent,
  senderName = "Clínica Saúde Total",
  senderEmail = "contato@clinicasaudetotal.com",
  recipientEmail = "maria.silva@email.com",
}: EmailClientPreviewProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white shadow-lg">
      {/* Gmail-like Header */}
      <div className="border-b bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 text-gray-500" />
              <ArrowRight className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-sm text-gray-600">1 de 1</div>
          </div>

          <div className="flex items-center gap-2">
            <Archive className="h-4 w-4 text-gray-500" />
            <Trash2 className="h-4 w-4 text-gray-500" />
            <Tag className="h-4 w-4 text-gray-500" />
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Email Header */}
      <div className="border-b bg-white px-8 py-6">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-semibold text-white">
              {senderName.charAt(0).toUpperCase()}
            </div>

            {/* Sender Info */}
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  {senderName}
                </span>
                <Badge
                  variant="secondary"
                  className="border-blue-200 bg-blue-50 text-xs text-blue-700"
                >
                  Verificado
                </Badge>
              </div>
              <div className="mb-2 text-sm text-gray-600">
                <span className="text-gray-500">para</span>{" "}
                <span className="text-gray-900">{recipientEmail}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{senderEmail}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>hoje às 14:30</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 cursor-pointer p-1 text-gray-400 hover:text-yellow-500" />
            <Reply className="h-5 w-5 cursor-pointer p-1 text-gray-400 hover:text-gray-600" />
            <MoreHorizontal className="h-5 w-5 cursor-pointer p-1 text-gray-400 hover:text-gray-600" />
          </div>
        </div>

        {/* Subject */}
        <h1 className="mb-4 text-2xl font-normal text-gray-900">
          {subject || "Assunto do Email"}
        </h1>

        {/* Email metadata */}
        <div className="flex items-center gap-4 border-t pt-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Paperclip className="h-3 w-3" />
            <span>0 anexos</span>
          </div>
          <span>•</span>
          <span>Seguro e criptografado</span>
        </div>
      </div>

      {/* Email Content */}
      <div className="bg-white px-8 py-8">
        <div
          className="prose prose-base prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {/* Email Footer Actions */}
      <div className="border-t bg-gray-50 px-8 py-5">
        <div className="flex items-center gap-1">
          <Button
            size="default"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Reply className="mr-2 h-4 w-4" />
            Responder
          </Button>
          <Button size="default" variant="outline">
            <ReplyAll className="mr-2 h-4 w-4" />
            Responder a todos
          </Button>
          <Button size="default" variant="outline">
            <Forward className="mr-2 h-4 w-4" />
            Encaminhar
          </Button>
        </div>
      </div>

      {/* Gmail-like bottom info */}
      <div className="border-t bg-gray-50 px-6 py-3 text-center">
        <div className="text-sm text-gray-500">
          📧 Preview realista - Como aparecerá no Gmail
        </div>
      </div>
    </div>
  );
}
