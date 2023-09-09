// queries.tsx

export const proposalsQuery = `
  {
    proposals (
      first: 5,
      skip: 0,
      where: {
        space_in: ["skatehive.eth"],
      },
      orderBy: "created",
      orderDirection: desc
    ) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      space {
        id
        name
      }
    }
  }
`;

export const votesQuery = (proposalIds: string[]) => `
  query {
    votes(
      first: 1000
      skip: 0
      where: {
        proposal_in: [${proposalIds.map(id => `"${id}"`).join(', ')}]
      }
    ) {
      proposal {
        id
        title
      }
      id
    }
  }
`;

