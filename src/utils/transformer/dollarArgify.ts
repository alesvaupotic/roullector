/** turns 'something[arg]something` into something$arg$something */
export function dollarArgify(str: string) {
  return str
    .trim()
    .replace(/\[([a-zA-Z_-]+)\](.*)$/g, function(match, p1, p2) {
      return match.replace(/\[[a-zA-Z_-]+\]/g, `$${p1}${p2?.length ? '$' : ''}`);
    });
}
