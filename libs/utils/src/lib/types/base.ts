export type AnyLiteral = Record<string, any>;
export type AnyClass = new (...args: any[]) => any;
export type AnyFunction = (...args: any[]) => any;
export type AnyToVoidFunction = (...args: any[]) => void;
export type BooleanToVoidFunction = (value: boolean) => void;
export type NoneToVoidFunction = () => void;

export type ScrollTargetPosition = ScrollLogicalPosition | 'centerOrTop';

export enum FocusDirection {
	Up,
	Down,
	Static
}
