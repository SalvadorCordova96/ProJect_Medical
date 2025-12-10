# =============================================================================
# backend/api/utils/pagination.py
# Utilidades de paginación para endpoints GET
# =============================================================================
"""
This module provides pagination utilities for GET endpoints.

Implements cursor-based and offset-based pagination with metadata
to help clients navigate through large result sets.
"""

from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel, Field
from fastapi import Query

# Generic type for paginated items
T = TypeVar('T')


class PaginationParams(BaseModel):
    """
    Standard pagination parameters for GET endpoints.
    
    Attributes:
        page: Page number (1-indexed)
        page_size: Number of items per page (1-100)
        skip: Number of items to skip (calculated from page and page_size)
    """
    page: int = Field(default=1, ge=1, description="Page number (1-indexed)")
    page_size: int = Field(default=50, ge=1, le=100, description="Items per page (max 100)")
    
    @property
    def skip(self) -> int:
        """Calculate number of items to skip based on page and page_size"""
        return (self.page - 1) * self.page_size
    
    @property
    def limit(self) -> int:
        """Alias for page_size for SQLAlchemy compatibility"""
        return self.page_size


class PageMetadata(BaseModel):
    """
    Metadata about the current page of results.
    
    Attributes:
        page: Current page number
        page_size: Items per page
        total_items: Total number of items across all pages
        total_pages: Total number of pages
        has_next: Whether there is a next page
        has_previous: Whether there is a previous page
    """
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_previous: bool


class PaginatedResponse(BaseModel, Generic[T]):
    """
    Generic paginated response wrapper.
    
    Wraps a list of items with pagination metadata.
    
    Type Parameters:
        T: Type of items in the data list
        
    Attributes:
        data: List of items for current page
        metadata: Pagination metadata
        
    Example:
        ```python
        response = PaginatedResponse[PacienteResponse](
            data=[paciente1, paciente2, ...],
            metadata=PageMetadata(
                page=1,
                page_size=50,
                total_items=150,
                total_pages=3,
                has_next=True,
                has_previous=False
            )
        )
        ```
    """
    data: List[T]
    metadata: PageMetadata


def create_pagination_metadata(
    page: int,
    page_size: int,
    total_items: int
) -> PageMetadata:
    """
    Create pagination metadata from query results.
    
    Args:
        page: Current page number (1-indexed)
        page_size: Number of items per page
        total_items: Total number of items in the dataset
        
    Returns:
        PageMetadata object with calculated fields
        
    Example:
        ```python
        total = db.query(Paciente).count()
        metadata = create_pagination_metadata(
            page=1,
            page_size=50,
            total_items=total
        )
        ```
    """
    total_pages = (total_items + page_size - 1) // page_size  # Ceiling division
    
    return PageMetadata(
        page=page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1
    )


def paginate(
    items: List[T],
    page: int,
    page_size: int,
    total_items: int
) -> PaginatedResponse[T]:
    """
    Create a paginated response from a list of items.
    
    Args:
        items: List of items for current page (already sliced)
        page: Current page number
        page_size: Items per page
        total_items: Total items across all pages
        
    Returns:
        PaginatedResponse with items and metadata
        
    Example:
        ```python
        query = db.query(Paciente)
        total = query.count()
        items = query.offset(skip).limit(page_size).all()
        
        return paginate(
            items=items,
            page=1,
            page_size=50,
            total_items=total
        )
        ```
    """
    metadata = create_pagination_metadata(page, page_size, total_items)
    return PaginatedResponse(data=items, metadata=metadata)


# FastAPI dependency for pagination parameters
def get_pagination_params(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page (max 100)")
) -> PaginationParams:
    """
    FastAPI dependency for extracting pagination parameters from query string.
    
    Usage in endpoints:
        ```python
        @router.get("/items")
        async def list_items(
            pagination: PaginationParams = Depends(get_pagination_params),
            db: Session = Depends(get_db)
        ):
            total = db.query(Item).count()
            items = db.query(Item).offset(pagination.skip).limit(pagination.limit).all()
            return paginate(items, pagination.page, pagination.page_size, total)
        ```
    """
    return PaginationParams(page=page, page_size=page_size)
