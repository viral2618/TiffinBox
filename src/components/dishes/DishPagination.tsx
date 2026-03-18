"use client"

import { useAppDispatch, useAppSelector } from "@/redux/store"
import { setPage } from "@/redux/features/publicDishSlice"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export default function DishPagination() {
  const dispatch = useAppDispatch()
  const { pagination } = useAppSelector((state) => state.publicDish)

  const handlePageChange = (page: number) => {
    dispatch(setPage(page))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (pagination.pages <= 1) return null

  const getVisiblePages = () => {
    const current = pagination.page
    const total = pagination.pages
    const delta = 2

    let start = Math.max(1, current - delta)
    let end = Math.min(total, current + delta)

    if (current - delta <= 1) {
      end = Math.min(total, 1 + 2 * delta)
    }
    if (current + delta >= total) {
      start = Math.max(1, total - 2 * delta)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const visiblePages = getVisiblePages()

  return (
    <div className="mt-8">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(pagination.page - 1)}
              className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {visiblePages[0] > 1 && (
            <>
              <PaginationItem>
                <PaginationLink 
                  onClick={() => handlePageChange(1)}
                  className="cursor-pointer"
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {visiblePages[0] > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {visiblePages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => handlePageChange(page)}
                isActive={page === pagination.page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {visiblePages[visiblePages.length - 1] < pagination.pages && (
            <>
              {visiblePages[visiblePages.length - 1] < pagination.pages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink 
                  onClick={() => handlePageChange(pagination.pages)}
                  className="cursor-pointer"
                >
                  {pagination.pages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(pagination.page + 1)}
              className={pagination.page >= pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}