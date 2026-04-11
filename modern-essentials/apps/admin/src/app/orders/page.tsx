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
    <div className="flex flex-col h-full bg-surface">
      <Header title="Today's Orders" />
      <div className="flex-1 p-6 space-y-8 max-w-7xl mx-auto w-full">
        <OrderFilterTabs counts={counts} total={total} />

        <div className="rounded-2xl bg-surface-container-low overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-0">
              <thead className="bg-surface-container-high/50">
                <tr>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Order ID
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Customer
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Items
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Total
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Type
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Placed At
                  </th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface-container-low/30">
                {orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-20 text-center text-muted-foreground italic font-medium"
                    >
                      No orders found for today
                      {status && status !== "ALL" ? ` with status "${status}"` : ""}.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-surface-container-low transition-all duration-200 group"
                    >
                      <td className="px-6 py-6 text-sm font-mono font-medium text-foreground">
                        {order.id.slice(-8)}
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-sm font-bold text-foreground">
                          {order.user.phone}
                        </p>
                        {order.user.email && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {order.user.email}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-6 text-sm text-muted-foreground max-w-xs truncate">
                        {order.items
                          .map((i) => `${i.product.name} ×${i.qty}`)
                          .join(", ")}
                      </td>
                      <td className="px-6 py-6 text-sm font-bold text-foreground">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-6">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                            order.type === "SUBSCRIPTION_RENEWAL"
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {order.type === "SUBSCRIPTION_RENEWAL" ? "SUBSCRIPTION" : "ONE-TIME"}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-6 text-sm text-muted-foreground">
                        {formatDate(order.placedAt.toISOString())}
                      </td>
                      <td className="px-6 py-6">
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
