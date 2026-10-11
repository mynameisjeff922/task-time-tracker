"use client";
// A delete button that asks "Are you sure?" before running a Server Action.

interface DeleteButtonProps {
  action: () => Promise<void>;
  label?: string;
  confirmText: string;
  className?: string;
}

export default function DeleteButton({ action, label = "Delete", confirmText, className = "" }: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <button type="submit" className={`text-xs text-muted hover:text-danger ${className}`}>
        {label}
      </button>
    </form>
  );
}
