import Link from "next/link";
import { Mic } from "lucide-react";
import { getIntakeScriptQuestionsForAdmin } from "@/lib/admin/intake-questions-queries";
import { setIntakePillarQuestionVisibility } from "@/lib/actions/admin-intake-questions-actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function snippet(text: string, max = 140) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export default async function AdminIntakeQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const sp = await searchParams;
  const showSaved = sp.saved === "1";
  const questions = await getIntakeScriptQuestionsForAdmin();

  return (
    <div className="space-y-6">
      {showSaved ? (
        <Alert variant="success">
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>Intake script changes are live for new interview loads.</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mic className="size-4 shrink-0" aria-hidden />
            <span>Client audio intake uses these pillar rows when present and visible.</span>
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/intake">Back to intake interviews</Link>
        </Button>
      </div>

      {questions.length === 0 ? (
        <Alert>
          <AlertTitle>No intake questions in the database</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              The interview falls back to the static list in{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">src/lib/intake/questions.ts</code>
              . Seed or migrate INTAKE category rows in the pillar question tables to manage them
              here.
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Script questions <span className="font-normal text-muted-foreground">({questions.length})</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Order follows section and display order (same sort as the live interview). Hidden
              questions are omitted from the client script.
            </p>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-border px-0 pb-0">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="flex flex-col gap-3 px-6 py-4 first:pt-2 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      #{index + 1}
                    </span>
                    <Badge variant="outline" className="text-xs font-normal">
                      {q.section.name}
                    </Badge>
                    {q.isVisible ? (
                      <Badge variant="success" className="text-xs">
                        Visible
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Hidden
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium leading-snug">{snippet(q.questionText, 220)}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">id: {q.id}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <form action={setIntakePillarQuestionVisibility}>
                    <input type="hidden" name="questionId" value={q.id} />
                    <input type="hidden" name="setVisible" value={q.isVisible ? "0" : "1"} />
                    <Button type="submit" variant="outline" size="sm">
                      {q.isVisible ? "Hide from interview" : "Show in interview"}
                    </Button>
                  </form>
                  <Button size="sm" asChild>
                    <Link href={`/admin/intake/questions/${q.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
