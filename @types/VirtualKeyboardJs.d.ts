declare class VirtualKeyboardJs {
    constructor();
    init(callback?: Function, forceLoad?: boolean);
    setInput(elementClass: string, containerClass: string, electronVirtualKeyboardCallBack?, config?);
    isElectron(): boolean;
}

export default VirtualKeyboardJs; 