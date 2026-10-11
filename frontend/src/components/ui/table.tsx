import { forwardRef, type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const TableWrapper = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('w-full overflow-x-auto scrollbar-thin', className)} {...props} />
))
TableWrapper.displayName = 'TableWrapper'

const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => (
  <table ref={ref} className={cn('w-full caption-bottom border-collapse text-sm', className)} {...props} />
))
Table.displayName = 'Table'

const THead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn('', className)} {...props} />,
)
THead.displayName = 'THead'

const TBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn('', className)} {...props} />,
)
TBody.displayName = 'TBody'

const TR = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('border-b border-line transition-colors last:border-0 hover:bg-slate-50/70', className)}
    {...props}
  />
))
TR.displayName = 'TR'

const TH = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn('whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-mutedfg', className)}
    {...props}
  />
))
TH.displayName = 'TH'

const TD = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('px-4 py-3.5 align-middle', className)} {...props} />
))
TD.displayName = 'TD'

export { Table, TableWrapper, THead, TBody, TR, TH, TD }
