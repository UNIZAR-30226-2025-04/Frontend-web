import { get, writable } from "svelte/store";

const nextKey = writable<number>(0);

export function getNextKey():number{
    nextKey.update(old => old+1);
    return get(nextKey);
}