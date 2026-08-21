from collections import defaultdict
from typing import Iterable

from modules.authorization.application import PermissionProvider
from modules.authorization.domain import Permission, Role


class InMemoryPermissionProvider(PermissionProvider):
    """Simple in-memory permissions repository for default platform roles."""

    def __init__(self, initial: dict[Role, Iterable[Permission]] | None = None) -> None:
        self._permissions: dict[Role, tuple[Permission, ...]] = defaultdict(tuple)
        if initial:
            for role, permissions in initial.items():
                self._permissions[role] = tuple(permissions)

    def get_permissions_for_role(self, role: Role) -> tuple[Permission, ...]:
        return self._permissions.get(role, tuple())

