declare interface Song {
  id: string
  name: string
  songAuthor: string
  levelAuthor: string
  albumCover: string
  duration: number
  beatsPerMinute: number
  difficulty: [
    {
      name: string
      requirements: string[]
    }
  ]
}
