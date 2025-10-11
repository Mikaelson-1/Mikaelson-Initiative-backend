export interface IRepository<T> {
  create(data: any): Promise<T>;
  findById(
    id: string | number,
    type: "user" | "post" | "challenge" | "comment" | "bookmark" | ""
  ): Promise<T | null>;
  findAll(
    type:
      | "user"
      | "post"
      | "TodayPost"
      | "like"
      | "userPosts"
      | "userTodayPosts"
      | "challenge"
      | "comment"
      | "searchPosts"
      | "searchUsers"
      | "bookmark"
      | "topContributors"
      | "followers"
      | "following"
      | "challengeMembers"
      | "userLikes"
      | "userChallengePosts"
      | "getFollowingPosts",
    id?: string | number,
    id2?: string | number,
    params?: {
      filter?: any;
      skip?: any;
      take?: number;
      orderBy?: "asc" | "desc";
    }
  ): Promise<T[]>;
  findFirst(
    targetId: string | number,
    id: string | number,
    type?: "like" | "bookmark" | "follow" | "challengeMember" | "",
    likeWhat?: "post" | "comment"
  ): Promise<T | null>;
  update(
    id: string | number,
    data?: Partial<T>,
    type?: "user" | "views"
  ): Promise<T | null>;
  delete(id: string | number): Promise<boolean>;
}
