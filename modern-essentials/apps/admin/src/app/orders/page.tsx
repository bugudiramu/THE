import { Suspense } from "react";
import { Header } from "@/components/header";
import { StatusBadge } from "@/components/orders/status-badge";
import { OrderFilterTabs } from "@/components/orders/order-filter-tabs";
import { OrderAction } from "@/components/orders/order-action";
import { formatPrice, formatDate } from "@/lib/utils";
import { prisma } from "@/lib/db";

async function getOrders(status?: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const where: any = {
    placedAt: {
      gte: startOfDay,
      lte: endOfDay,
    },
  };

  if (status && status !== "ALL") {
    where.status = status;
  }

  return prisma.order.findMany({
    where,
    include: {
      user: {
        select: { id: true, phone: true, email: true },
      },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      },
    },
    orderBy: {
      placedAt: "desc",
    },
  });
}

async function getStatusCounts() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const counts = await prisma.order.groupBy({
    by: ["status"],
    where: {
      placedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    _count: {
      status: true,
    },
  });

  const statusMap: Record<string, number> = {};
  let total = 0;

  counts.forEach((c) => {
    statusMap[c.status] = c._count.status;
    total += c._count.status;
  });

  return { counts: statusMap, total };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status;
  const [orders, { counts, total }] = await Promise.all([
    getOrders(status),
    getStatusCounts(),
  ]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Today's Orders" />
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        <OrderFilterTabs counts={counts} total={total} />

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Placed At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-muted-foreground"
                    >
                      No orders found for today
                      {status && status !== "ALL" ? ` with status "${status}"` : ""}.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-mono text-foreground">
                        {order.id.slice(-8)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-foreground">
                          {order.user.phone}
                        </p>
                        {order.user.email && (
                          <p className="text-xs text-muted-foreground">
                            {order.user.email}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {order.items
                          .map((i) => `${i.product.name} ×${i.qty}`)
                          .join(", ")}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(order.placedAt.toISOString())}
                      </td>
                      <td className="px-4 py-3">
                        <OrderAction
                          orderId={order.id}
                          currentStatus={order.status}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
