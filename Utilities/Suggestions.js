const MIN_LETTERS = 2;
const MAX_SEARCH_OPTIONS = 4;

let lookups = {};

document.suggestions = {
  add: (value, category) => {
    if (!(category in lookups)) lookups[category] = new LookUp();
    lookups[category].add(value);
  },
  search: (value, category) => {
    console.log(value, category);
    let result = "";
    if (typeof category === "string" && category in lookups) {
      result = lookups[category].search(value);
    }
    return result
  }
}

class LookUp {
  constructor() {
    let names = {};
    let lookup = {};

    let contains = (value) => {return value in names}

    let addSubValue = (value, og) => {
      if (!(value in lookup)) lookup[value] = {};
      lookup[value][og] = true;
    }

    let insert = (value, og = value) => {
      let subValue = value.substring(0, value.length - 1);
      if (subValue.length >= MIN_LETTERS) {
        addSubValue(subValue, og);
        insert(subValue, og);
      }
    }

    let add = (value) => {
      if (!contains(value)) {
        names[value] = true;
        insert(value);
      }
    }

    let matches = (value) => {
      let result = [];
      if (typeof value === "string" && value in lookup) {
        result = Object.keys(lookup[value])
      }
      return result;
    }

    let search = (value) => {
      let result = ""
      let m = matches(value);
      if (m.length > 0 && m.length < MAX_SEARCH_OPTIONS) {
        m.sort((a, b) => a.length > b.length ? 1 : -1)
        result = m[0];
      }

      return result;
    }

    this.add = add;
    this.contains = contains;
    this.matches = matches;
    this.search = search;
  }
}
