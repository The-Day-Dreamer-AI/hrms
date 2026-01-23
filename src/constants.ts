import { Ban, CheckCircle2, Clock, FileCheck2, MessageCircleX, Undo2 } from "lucide-react";

export const STATUS = {
  APPROVED: "approved",
  REJECTED: "rejected",
  PENDING: "pending",
  REVOKED: "revoked",
  CANCELLED: "cancelled",
};

export const STATUS_COLOR = {
  [STATUS.REJECTED]: "bg-destructive hover:bg-destructive",
  [STATUS.PENDING]: "bg-orange-500 hover:bg-orange-500",
  [STATUS.APPROVED]: "bg-green-500 hover:bg-green-500",
  [STATUS.REVOKED]: "bg-gray-500 hover:bg-gray-500",
  [STATUS.CANCELLED]: "bg-gray-300 hover:bg-gray-300",
};

export const statusSelections = [
  { label: "Approved", value: "approved", icon: CheckCircle2 },
  { label: "Pending", value: "pending", icon: Clock },
  { label: "Rejected", value: "rejected", icon: Ban },
  { label: "Processed", value: "processed", icon: FileCheck2 },
  { label: "Cancelled", value: "cancelled", icon: MessageCircleX },
];

export const CLAIM_STATUS = {
  APPROVED: "approved",
  REJECTED: "rejected",
  PENDING: "pending",
  CANCELLED: "cancelled",
};

export const ACTION_STATUS = {
  CANCEL: "cancel",
  EDIT: "edit",
};

export const LeaveStatusOptions = [
  { label: "Approved", value: "approved", icon: CheckCircle2 },
  { label: "Pending", value: "pending", icon: Clock },
  { label: "Rejected", value: "rejected", icon: Ban },
  { label: "Revoked", value: "revoked", icon: Undo2 },
  { label: "Cancelled", value: "cancelled", icon: MessageCircleX },
];
