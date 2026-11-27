import test from "node:test";
import assert from "node:assert/strict";
import { readRememberedEmail, rememberEmail } from "../src/lib/remember-email.ts";
test("lembrar somente o e-mail; desmarcar apaga a preferência",()=>{
  const m=new Map<string,string>();
  const storage={getItem:(key:string)=>m.get(key)??null,setItem:(key:string,value:string)=>{m.set(key,value)},removeItem:(key:string)=>{m.delete(key)}};
  assert.equal(readRememberedEmail(storage),"");
  rememberEmail(" usuario@example.test ",storage);
  assert.equal(readRememberedEmail(storage),"usuario@example.test");
  assert.deepEqual([...m.values()],["usuario@example.test"]);
  rememberEmail("",storage);
  assert.equal(m.size,0);
});
test("bloqueio de armazenamento não impede login",()=>{
  const fail=()=>{throw Error("storage blocked")};
  const storage={getItem:fail,setItem:fail,removeItem:fail};
  assert.equal(readRememberedEmail(storage),"");
  assert.doesNotThrow(()=>rememberEmail("usuario@example.test",storage));
});
