interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
  locationId?: number | null;
  location?: { id: number; city: string; state: string } | null;
}

export const validateUsersLocation = (users: UserOption[], serviceLocationId: number): string | null => {
  // Check for users without location (all users must have a location)
  const usersWithoutLocation = users.filter(user => {
    const userLocationId = user.locationId || user.location?.id;
    return !userLocationId;
  });

  if (usersWithoutLocation.length > 0) {
    const invalidNames = usersWithoutLocation.map(user => user.name).join(', ');
    return `Os seguintes usuários não podem ser associados pois não possuem localização definida: ${invalidNames}`;
  }

  // Check for ALL users with different location (all users must have same location as service)
  const usersWithDifferentLocation = users.filter(user => {
    const userLocationId = user.locationId || user.location?.id;
    return userLocationId && userLocationId !== serviceLocationId;
  });

  if (usersWithDifferentLocation.length > 0) {
    const invalidNames = usersWithDifferentLocation.map(user => user.name).join(', ');
    return `Os seguintes usuários não podem ser associados pois possuem localização diferente do serviço: ${invalidNames}`;
  }

  return null;
};
