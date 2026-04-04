"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function DesignSystemDemo() {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="tokens-heading" className="flex flex-col gap-3">
        <h2 id="tokens-heading" className="text-lg font-medium">
          Design tokens
        </h2>
        <ul className="flex flex-wrap gap-3" role="list">
          <li className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <span className="size-4 rounded-sm bg-price-down" aria-hidden />
            <span className="text-price-down">price-down</span>
          </li>
          <li className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <span className="size-4 rounded-sm bg-price-up" aria-hidden />
            <span className="text-price-up">price-up</span>
          </li>
          <li className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <span className="size-4 rounded-sm bg-stable" aria-hidden />
            <span className="text-stable">stable</span>
          </li>
          <li className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <span className="size-4 rounded-sm bg-anomaly" aria-hidden />
            <span className="text-anomaly">anomaly</span>
          </li>
          <li className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
            <span className="size-4 rounded-sm bg-user-price" aria-hidden />
            <span className="text-user-price">user-price</span>
          </li>
        </ul>
      </section>

      <section aria-labelledby="type-heading" className="flex flex-col gap-2">
        <h2 id="type-heading" className="text-lg font-medium">
          Tabular numerals (prices)
        </h2>
        <p className="tabular-nums-price text-2xl font-medium">
          $1,234.56 vs $9,876.54
        </p>
      </section>

      <section aria-labelledby="components-heading" className="flex flex-col gap-4">
        <h2 id="components-heading" className="text-lg font-medium">
          shadcn/ui
        </h2>
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              Open dialog
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sample dialog</DialogTitle>
                <DialogDescription>
                  Dialog, button, and input components are wired for accessibility.
                </DialogDescription>
              </DialogHeader>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Label
                <Input placeholder="Filter products" />
              </label>
            </DialogContent>
          </Dialog>
          <Button
            type="button"
            variant="secondary"
            onClick={() => toast.success("Toast via Sonner")}
          >
            Show toast
          </Button>
        </div>
      </section>

      <section aria-labelledby="table-heading" className="max-w-xl">
        <h2 id="table-heading" className="mb-3 text-lg font-medium">
          Table
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Product</TableHead>
              <TableHead scope="col" className="text-right tabular-nums-price">
                Price
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Example SKU</TableCell>
              <TableCell className="text-right tabular-nums-price text-price-down">
                $42.00
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>
    </div>
  )
}
