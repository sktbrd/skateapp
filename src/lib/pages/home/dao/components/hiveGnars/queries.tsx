// Optimized queries for getting account summary i.e vote history and curration history

// export const VotingSummaryQuery = (username: string) => `
// WITH VoteData AS (
//   SELECT
//     CASE
//       WHEN c.total_payout_value > 0 THEN (c.total_payout_value + c.curator_payout_value) * CAST(JSON_VALUE(av.value, '$.rshares') AS DECIMAL(18, 6)) / total_rshares.total_rshares
//       WHEN c.pending_payout_value > 0 THEN c.pending_payout_value * CAST(JSON_VALUE(av.value, '$.rshares') AS DECIMAL(18, 6)) / total_rshares.total_rshares
//       ELSE 0
//     END AS vote_value,
//     v.author
//   FROM
//     TxVotes v
//   INNER JOIN
//     Comments c ON v.author = c.author AND v.permlink = c.permlink
//   CROSS APPLY
//     OPENJSON(c.active_votes) AS av
//   JOIN (
//     SELECT
//       author AS comment_author,
//       permlink AS comment_permlink,
//       SUM(CAST(JSON_VALUE(value, '$.rshares') AS BIGINT)) AS total_rshares
//     FROM
//       Comments
//     CROSS APPLY
//       OPENJSON(active_votes) AS av
//     GROUP BY
//       author, permlink
//   ) AS total_rshares ON c.author = total_rshares.comment_author AND c.permlink = total_rshares.comment_permlink
//   WHERE
//     v.voter = '${username}' AND
//     JSON_VALUE(av.value, '$.voter') = '${username}'
//   )
//   SELECT
//     SUM(vote_value) AS total_vote_value,
//     COUNT(*) AS number_of_votes,
//     COUNT(DISTINCT author) AS number_of_unique_authors
//   FROM
//     VoteData;
// `;

// export const CurrationSummaryQuery = (username: string) => `
//   WITH HPTotal AS (
//     SELECT
//       SUM((dgp.total_vesting_fund_hive * vcr.reward) / dgp.total_vesting_shares) AS total_hp
//     FROM
//       VOCurationRewards vcr
//     JOIN (
//       SELECT TOP 1
//         total_vesting_fund_hive,
//         total_vesting_shares
//       FROM
//         DynamicGlobalProperties
//     ) AS dgp ON 1 = 1
//     WHERE
//       vcr.curator = '${username}'
//   )
//   SELECT TOP 1
//     total_hp
//   FROM
//     HPTotal;
// `;

export const VoteHistoryQuery = (username: string) => `
  SELECT
    v.author,
    v.permlink,
    v.weight,
    v.timestamp,
    CASE
      WHEN c.total_payout_value > 0 THEN (c.total_payout_value + c.curator_payout_value) * CAST(JSON_VALUE(av.value, '$.rshares') AS DECIMAL(18, 6)) / total_rshares.total_rshares
      WHEN c.pending_payout_value > 0 THEN c.pending_payout_value * CAST(JSON_VALUE(av.value, '$.rshares') AS DECIMAL(18, 6)) / total_rshares.total_rshares
      ELSE 0
    END AS vote_value 
  FROM
    TxVotes v
  INNER JOIN
    Comments c ON v.author = c.author AND v.permlink = c.permlink
  CROSS APPLY
    OPENJSON(c.active_votes) AS av
  JOIN (
    SELECT
      author AS comment_author,
      permlink AS comment_permlink,
      SUM(CAST(JSON_VALUE(value, '$.rshares') AS BIGINT)) AS total_rshares
    FROM
      Comments
    CROSS APPLY
      OPENJSON(active_votes) AS av
    GROUP BY
      author, permlink
  ) AS total_rshares ON c.author = total_rshares.comment_author AND c.permlink = total_rshares.comment_permlink
  WHERE
    v.voter = '${username}' AND
    JSON_VALUE(av.value, '$.voter') = '${username}'
  ORDER BY
    v.timestamp DESC;
`;

export const CurrationHistoryQuery = (username: string) => `
  SELECT
    vcr.block_num,
    vcr.timestamp,
    vcr.author,
    vcr.permlink,
    (dgp.total_vesting_fund_hive * vcr.reward) / dgp.total_vesting_shares AS hp
  FROM
    VOCurationRewards vcr
  JOIN
    (
      SELECT TOP 1
        total_vesting_fund_hive,
        total_vesting_shares
      FROM
        DynamicGlobalProperties
    ) AS dgp ON 1 = 1
  WHERE
    vcr.curator = '${username}'
  ORDER BY
    timestamp DESC;
`;
