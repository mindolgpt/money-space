import * as Network from 'expo-network'

type NetworkListener = (isOnline: boolean) => void

let listeners: NetworkListener[] = []
let currentStatus = true

export function getNetworkStatus(): boolean {
  return currentStatus
}

export function setNetworkStatus(isOnline: boolean): void {
  if (currentStatus !== isOnline) {
    currentStatus = isOnline
    listeners.forEach((fn) => fn(isOnline))
  }
}

export function onNetworkChange(listener: NetworkListener): () => void {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((fn) => fn !== listener)
  }
}

export async function isWifi(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync()
    return state.isConnected && state.type === Network.NetworkStateType.WIFI
  } catch {
    return false
  }
}
