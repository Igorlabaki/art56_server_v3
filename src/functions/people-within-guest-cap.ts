type ListedPerson = { type: "GUEST" | "WORKER" };

export function peopleWithinGuestCap<T extends ListedPerson>(input: {
    people: T[];
    savedGuestCount: number;
    guestNumber: number;
}): T[] {
    if (input.savedGuestCount < input.guestNumber) return input.people;
    return input.people.filter((person) => person.type === "WORKER");
}
