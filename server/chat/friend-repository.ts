export default class FriendRepository {
  friends: Record<string, Set<string>>

  constructor() {
    // Fake the relationship to display list of users and who is online.
    this.friends = {
      john: new Set(["alice", "bob", "jane"]),
      alice: new Set(["john"]),
      bob: new Set(["john", "alice"])
    };
  }

  findByUserId(userId: string): string[] {
    return Array.from(this.friends[userId] ?? [])
  }
}
