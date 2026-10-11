import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import { cn } from '@/lib/utils'

const Dropdown = DropdownPrimitive.Root
const DropdownTrigger = DropdownPrimitive.Trigger

const DropdownContent = forwardRef<
  ElementRef<typeof DropdownPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <DropdownPrimitive.Portal>
    <DropdownPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[220px] overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-lift data-[state=open]:animate-scale-in',
        className,
      )}
      {...props}
    />
  </DropdownPrimitive.Portal>
))
DropdownContent.displayName = 'DropdownContent'

const DropdownItem = forwardRef<
  ElementRef<typeof DropdownPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownPrimitive.Item
    ref={ref}
    className={cn(
      'flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-navy-800 outline-none transition-colors focus:bg-slate-100 data-[highlighted]:bg-slate-100 [&_svg]:size-4 [&_svg]:text-slate-500',
      className,
    )}
    {...props}
  />
))
DropdownItem.displayName = 'DropdownItem'

function DropdownLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400', className)} {...props} />
}

function DropdownSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('-mx-1.5 my-1.5 h-px bg-line', className)} {...props} />
}

export { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownLabel, DropdownSeparator }
