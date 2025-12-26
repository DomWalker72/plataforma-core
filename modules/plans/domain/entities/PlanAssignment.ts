export class PlanAssignment {
  constructor(
    public readonly assignmentId: string,
    public readonly userId: string,
    public readonly planId: string,
    public readonly appliedAt: Date,
    public readonly effectiveRoles: string[],
    public readonly metadata: Record<string, unknown> = {}
  ) {}
}
