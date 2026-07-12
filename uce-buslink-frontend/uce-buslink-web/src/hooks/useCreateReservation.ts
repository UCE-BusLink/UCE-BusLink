import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, useUser } from '@clerk/clerk-react';
import { createReservation } from '../services/reservationService';
import type { ApiReservation, ApiSeat } from '../types';

export function useCreateReservation() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ tripId, seatId, boardingStopId }: { tripId: string, seatId: string, boardingStopId: string }) => {
      const token = await getToken({ template: 'uce-buslink' });
      if (!token) throw new Error('No auth token');
      return await createReservation(token, { tripId, seatId, boardingStopId });
    },
    onMutate: async (newRes) => {
      // Optimistic Update para los asientos de este viaje
      await queryClient.cancelQueries({ queryKey: ['seats', newRes.tripId] });
      const previousSeats = queryClient.getQueryData<ApiSeat[]>(['seats', newRes.tripId]);

      if (previousSeats) {
        queryClient.setQueryData<ApiSeat[]>(['seats', newRes.tripId], (old: any) =>
          old?.map((seat: any) => seat.id === newRes.seatId ? { ...seat, state: 'RESERVED' } : seat)
        );
      }

      // Devolver contexto para revertir en caso de error
      return { previousSeats };
    },
    onError: (err, newRes, context) => {
      if (context?.previousSeats) {
        queryClient.setQueryData(['seats', newRes.tripId], context.previousSeats);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seats', variables.tripId] });
      queryClient.invalidateQueries({ queryKey: ['active-reservations'] });
    }
  });

  return {
    confirm: async (tripId: string, seatId: string, boardingStopId: string) => {
      try {
        // En un escenario offline-first puro podríamos devolver un objeto local,
        // pero useMutation.mutateAsync esperará al backend o devolverá el promise diferido.
        // Simulamos la reserva exitosa de inmediato para la UI:
        mutation.mutate({ tripId, seatId, boardingStopId });

        // Retornamos un objeto falso optimista para que la UI no se bloquee
        return {
          id: `local-res-${Date.now()}`,
          tripId,
          seatId,
          boardingStopId,
          status: 'ACTIVE',
          qrCode: `local-qr-${Date.now()}`
        } as ApiReservation;
      } catch (err) {
        return null;
      }
    },
    loading: mutation.isPending,
    error: mutation.error instanceof Error ? mutation.error.message : null,
  };
}
