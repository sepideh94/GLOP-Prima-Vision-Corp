export function filterVolunteers(volunteers, search) {
  if (!search) return volunteers;

  const term = search.toLowerCase();

  return volunteers.filter(
    (v) =>
      v.firstName?.toLowerCase().includes(term) ||
      v.lastName?.toLowerCase().includes(term) ||
      v.email?.toLowerCase().includes(term)
  );
}