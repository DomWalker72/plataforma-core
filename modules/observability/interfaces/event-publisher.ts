import { AuditEvent } from '../domain/audit-event';

/**
 * Publisher contract for audit events so producers are decoupled from logging
 * and storage implementations.
 *
 * Implementations may dispatch events synchronously today while being
 * compatible with asynchronous transports in the future.
 */
export interface EventPublisher {
  /**
   * Publish a single audit event.
   *
   * The return type accepts both synchronous and asynchronous implementations
   * so modules can start emitting events without awaiting capabilities. When
   * asynchronous behavior is introduced, callers can optionally `await` the
   * promise without changing their integration.
   */
  publish(event: AuditEvent): void | Promise<void>;

  /**
   * Publish multiple audit events in a batch. Useful for high-volume
   * operations or bulk processing pipelines. Implementations may choose to
   * handle this efficiently (e.g., buffering, batching, or transactional
   * writes).
   */
  publishMany?(events: AuditEvent[]): void | Promise<void>;
}
