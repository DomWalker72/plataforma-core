export enum PlanStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export type PlanRoleMapping = {
  planRole: string;
  rbacRoles: string[];
};

export type UsageLimitRule = {
  scope: { module?: string; feature?: string };
  limit: number;
  period: "daily" | "weekly" | "monthly" | "yearly" | "lifetime";
};

export type FeatureAccessRule = {
  module: string;
  feature: string;
  allowed: boolean;
  usageLimit?: UsageLimitRule;
};

export type ModuleAccessRule = {
  module: string;
  allowed: boolean;
  featureRules?: FeatureAccessRule[];
  usageLimit?: UsageLimitRule;
};

export class Plan {
  constructor(
    public readonly planId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly status: PlanStatus,
    public readonly roleMappings: PlanRoleMapping[],
    public readonly moduleRules: ModuleAccessRule[],
    public readonly featureRules: FeatureAccessRule[],
    public readonly usageLimits: UsageLimitRule[]
  ) {}

  isActive(): boolean {
    return this.status === PlanStatus.ACTIVE;
  }

  allowsModule(module: string): boolean {
    const rule = this.moduleRules.find((item) => item.module === module);
    if (!rule) return false;
    return rule.allowed;
  }

  allowsFeature(module: string, feature: string): boolean {
    const moduleRule = this.moduleRules.find((item) => item.module === module);
    if (moduleRule?.featureRules) {
      const featureRule = moduleRule.featureRules.find(
        (item) => item.feature === feature
      );
      if (featureRule) return featureRule.allowed;
    }

    const rule = this.featureRules.find(
      (item) => item.module === module && item.feature === feature
    );
    return rule ? rule.allowed : false;
  }

  usageLimitFor(scope: { module?: string; feature?: string }): UsageLimitRule | undefined {
    const matchFeature =
      scope.module &&
      scope.feature &&
      this.featureRules
        .find((item) => item.module === scope.module && item.feature === scope.feature)
        ?.usageLimit;

    if (matchFeature) return matchFeature;

    const matchModule =
      scope.module &&
      this.moduleRules.find((item) => item.module === scope.module)?.usageLimit;
    if (matchModule) return matchModule;

    return this.usageLimits.find(
      (limit) =>
        (scope.module === limit.scope.module || !limit.scope.module) &&
        (scope.feature === limit.scope.feature || !limit.scope.feature)
    );
  }

  mappedRoles(): string[] {
    const roles = this.roleMappings.flatMap((mapping) => mapping.rbacRoles);
    return Array.from(new Set(roles));
  }
}
