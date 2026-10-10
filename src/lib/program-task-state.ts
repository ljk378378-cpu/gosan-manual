export function mergeProgramTasks<T extends { id: string; programId: string }>(current: T[], incoming: T[], programId: string) {
  const ownTasks = new Map(current.filter(task => task.programId === programId).map(task => [task.id, task]))
  incoming.filter(task => task.programId === programId).forEach(task => ownTasks.set(task.id, task))
  return [...current.filter(task => task.programId !== programId), ...ownTasks.values()]
}
