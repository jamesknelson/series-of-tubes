export type SeriesOfTubesMessages = { [type: string]: any }

export interface SeriesOfTubesOptions {
  id: string,
  destination: Window,
  inNamespace?: string,
  outNamespace?: string,
}

export function createSeriesOfTubes(options: SeriesOfTubesOptions) {
  return new SeriesOfTubes(options)
}

export class SeriesOfTubes<In extends SeriesOfTubesMessages, Out extends SeriesOfTubesMessages> {
  options: SeriesOfTubesOptions
  wildcardSubscriptions: Function[]
  typeSubscriptions: {
    [type: string]: Function[]
  }

  constructor(options: SeriesOfTubesOptions) {
    this.options = Object.assign({ inNamespace: '', outNamespace: '' }, options)
    this.typeSubscriptions = {}
    this.wildcardSubscriptions = []
    window.addEventListener("message", this.handleMessage, false);
  }

  subscribe(listener: <InType extends keyof In>(type: InType, data: In[InType]) => void) {
    this.wildcardSubscriptions.push(listener)
  }

  subscribeTo<InType extends keyof In>(type: InType, listener: (data: In[InType]) => void): void {
    let typeSubscriptions = this.typeSubscriptions[type as string]
    if (!typeSubscriptions) {
      typeSubscriptions = this.typeSubscriptions[type as string] = []
    }
    typeSubscriptions.push(listener)
  }
  
  dispatch<OutType extends keyof Out>(type: OutType, payload: Out[OutType]) {
    this.options.destination.postMessage({
      type: this.options.outNamespace+type,
      payload: payload,
      id: this.options.id,
    }, '*');
  }

  dispose(): void {
    window.removeEventListener("message", this.handleMessage, false);
    delete this.wildcardSubscriptions
    delete this.typeSubscriptions
  }

  private handleMessage = (e: MessageEvent) => {
    let { id, inNamespace } = this.options
    let data = e.data;
    if (!data || data.type.indexOf(inNamespace) !== 0 || data.id !== id) {
      return;
    }
    let type = data.type.replace(inNamespace, '');
    let typeSubscriptions = (this.typeSubscriptions[type] || [])
    for (let i = 0; i < typeSubscriptions.length; i++) {
      typeSubscriptions[i](data.payload)
    }
    for (let i = 0; i < this.wildcardSubscriptions.length; i++) {
      this.wildcardSubscriptions[i](type, data.payload)
    }
  }  
}
