export interface BurstState {
  projectId: string | null
  progress: number
}

export const burstState: BurstState = {
  projectId: null,
  progress: 0,
}
