/**
 * Contract for any audit trail event emitted by platform modules.
 * 
 * This interface intentionally avoids references to logging or persistence
 * internals so producers can describe events without coupling to specific
 * transport or storage implementations.
 */
export interface AuditEvent {
  /** Unique identifier for this event (UUID recommended). */
  eventId: string;

  /** Source module or bounded context emitting the event (e.g., "identity"). */
  source: string;

  /** Machine-friendly action verb describing what happened (e.g., "user.created"). */
  action: string;

  /** ISO-8601 timestamp when the action occurred (producer clock). */
  occurredAt: string;

  /** Actor responsible for the action (human, service, or system). */
  actor: AuditActor;

  /**
   * Primary entity affected by the action (resource, record, or aggregate).
   * Optional to allow events that describe global actions without a specific target.
   */
  target?: AuditTarget;

  /** Correlation identifier for tracing actions across modules and requests. */
  correlationId?: string;

  /** Optional severity to aid routing decisions (e.g., alerting vs. storage only). */
  severity?: 'info' | 'warning' | 'error';

  /** Free-form attributes with structured context about the event. */
  attributes?: Record<string, unknown>;
}

/**
 * Actor that initiated the audited action. Keep fields small to avoid exposing
 * sensitive details; use identifiers and non-sensitive display labels only.
 */
export interface AuditActor {
  /** Stable identifier for the actor (user id, client id, or system code). */
  id: string;

  /**
   * Actor classification to support routing and policy decisions without
   * coupling to identity schemas.
   */
  type: 'user' | 'service' | 'system';

  /** Optional, user-friendly label for dashboards and human-readable trails. */
  displayName?: string;
}

/**
 * Entity affected by an audited action. Modules remain free to define their own
 * domain-specific identifiers as long as they supply a type and id.
 */
export interface AuditTarget {
  /** Stable identifier of the entity (record id, resource name, etc.). */
  id: string;

  /** Domain-specific type for the entity (e.g., "account", "invoice"). */
  type: string;

  /** Optional label shown in human-readable audit trail views. */
  displayName?: string;

  /** Optional locator hint such as path, URL, or hierarchical position. */
  location?: string;
}
