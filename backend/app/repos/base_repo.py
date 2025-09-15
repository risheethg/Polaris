from abc import ABC, abstractmethod
from typing import TypeVar, Generic, List, Optional, Any

# These generic types will be replaced by your actual Pydantic models
ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")

class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType], ABC):
    """
    Abstract base class for data repositories.
    It defines a standard interface for CRUD operations, using generic types
    that you would replace with your models from `app/models`.
    """

    @abstractmethod
    def get(self, item_id: Any) -> Optional[ModelType]:
        """Retrieve a single item by its ID."""
        raise NotImplementedError

    @abstractmethod
    def get_all(self, *, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Retrieve a list of items with pagination."""
        raise NotImplementedError

    @abstractmethod
    def create(self, *, obj_in: CreateSchemaType) -> ModelType:
        """Create a new item."""
        raise NotImplementedError

    @abstractmethod
    def update(self, *, item_id: Any, obj_in: UpdateSchemaType) -> Optional[ModelType]:
        """Update an existing item by its ID."""
        raise NotImplementedError

    @abstractmethod
    def delete(self, *, item_id: Any) -> Optional[ModelType]:
        """Delete an item by its ID."""
        raise NotImplementedError