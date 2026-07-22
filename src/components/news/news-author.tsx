import { UserRound } from "lucide-react";

type NewsAuthorProps = {
  displayName: string;
  clubFunction?: string | null;
};

export function NewsAuthor({
  displayName,
  clubFunction,
}: NewsAuthorProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <UserRound size={16} />

      <span>
        {displayName}

        {clubFunction ? (
          <span className="text-subtle">
            {" "}
            · {clubFunction}
          </span>
        ) : null}
      </span>
    </span>
  );
}