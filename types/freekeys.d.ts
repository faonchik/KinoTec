declare module 'freekeys' {
  interface FreeKeys {
    tmdb_key: string;
  }
  
  function freekeys(): Promise<FreeKeys>;
  export default freekeys;
}

