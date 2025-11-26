'use client';

import { getStatusColor, getStatusText } from '@/lib/utils';

interface OrderStatusProps {
  status: string;
  showTimeline?: boolean;
}

const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];

const statusIcons: Record<string, string> = {
  pending: '⏳',
  confirmed: '✅',
  preparing: '🍳',
  ready: '🎉',
  delivered: '🚚',
  cancelled: '❌',
};

export default function OrderStatus({ status, showTimeline = false }: OrderStatusProps) {
  if (!showTimeline) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
          status
        )}`}
      >
        <span>{statusIcons[status] || '📦'}</span>
        <span>{getStatusText(status)}</span>
      </span>
    );
  }

  const currentIndex = statusOrder.indexOf(status);
  const isCancelled = status === 'cancelled';

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {statusOrder.map((s, index) => {
          const isCompleted = !isCancelled && currentIndex >= index;
          const isCurrent = s === status;

          return (
            <div key={s} className="flex flex-col items-center flex-1">
              <div className="relative flex items-center justify-center w-full">
                {index > 0 && (
                  <div
                    className={`absolute left-0 right-1/2 h-1 ${
                      isCompleted ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                  />
                )}
                {index < statusOrder.length - 1 && (
                  <div
                    className={`absolute right-0 left-1/2 h-1 ${
                      !isCancelled && currentIndex > index
                        ? 'bg-primary-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}

                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    isCompleted
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-primary-200' : ''}`}
                >
                  {statusIcons[s]}
                </div>
              </div>

              <span
                className={`mt-2 text-xs text-center ${
                  isCompleted ? 'text-primary-500 font-medium' : 'text-gray-400'
                }`}
              >
                {getStatusText(s)}
              </span>
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <div className="mt-4 text-center">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor('cancelled')}`}>
            <span>{statusIcons.cancelled}</span>
            <span>Pedido cancelado</span>
          </span>
        </div>
      )}
    </div>
  );
}
