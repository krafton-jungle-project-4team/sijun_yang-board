import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from "@nmm/ui/components";

type SectionSkeletonProps = {
    description: string;
    rows?: 1 | 2 | 3 | 4;
    title: string;
};

const skeletonRows = ["first", "second", "third", "fourth"] as const;

export function SectionSkeleton({ description, rows = 3, title }: SectionSkeletonProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
                {skeletonRows.slice(0, rows).map((row) => (
                    <Skeleton key={row} className="h-12" />
                ))}
            </CardContent>
        </Card>
    );
}
