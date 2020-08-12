import { EventEmitter } from 'events'

export default class TypedEventEmitter<
  EventMap extends {
    [key: string]: (...args: any[]) => void
  }
> {
  private emitter: EventEmitter
  constructor() {
    this.emitter = new EventEmitter()
  }

  emit<EventName extends keyof EventMap>(
    event: EventName,
    ...args: Parameters<EventMap[EventName]>
  ) {
    this.emitter.emit(event as string, ...args)
  }

  on<EventName extends keyof EventMap>(
    event: EventName,
    callback: EventMap[EventName]
  ) {
    this.emitter.on(event as string, callback)
  }

  off<EventName extends keyof EventMap>(
    event: EventName,
    callback: EventMap[EventName]
  ) {
    this.emitter.off(event as string, callback)
  }
}
