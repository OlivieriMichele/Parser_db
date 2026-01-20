/**
 * UML → Schema Converter (conforme linee guida Schemi)
 */
export class UMLToSchemaConverter {
  constructor(umlData) {
    this.umlData = umlData;

    this.classMap = new Map();
    this.enumMap = new Map();
    this.interfaceMap = new Map();
    this.inheritanceMap = new Map();
    this.relations = umlData.relations || [];

    this.index();
  }

  index() {
    this.umlData.classes?.forEach(c => this.classMap.set(c.name, c));
    this.umlData.enums?.forEach(e => this.enumMap.set(e.name, e));
    this.umlData.interfaces?.forEach(i => this.interfaceMap.set(i.name, i));

    this.relations
      .filter(r => r.type === 'inheritance')
      .forEach(r => this.inheritanceMap.set(r.from, r.to));
  }

  convertAll() {
    return this.umlData.classes.map(cls => this.convertClass(cls));
  }

  convertClass(cls) {
    return {
      name: cls.name,
      icon: 'file',
      title: this.buildTitle(cls),
      attributes: this.buildAttributes(cls),
      permissions: {
        create: true,
        read: true,
        update: true,
        delete: true
      },
      derivesFrom: this.inheritanceMap.get(cls.name) || undefined
    };
  }

  buildAttributes(cls) {
    const attrs = [];

    // ereditarietà
    const parent = this.inheritanceMap.get(cls.name);
    if (parent && this.classMap.has(parent)) {
      attrs.push(...this.buildAttributes(this.classMap.get(parent)));
    }

    // interfacce
    this.relations
      .filter(r => r.type === 'implementation' && r.to === cls.name)
      .forEach(r => {
        const iface = this.interfaceMap.get(r.from);
        if (iface) {
          iface.attributes.forEach(a =>
            attrs.push(this.convertAttribute(a, cls.name))
          );
        }
      });

    // attributi propri
    cls.attributes.forEach(a =>
      attrs.push(this.convertAttribute(a, cls.name))
    );

    return attrs;
  }

  convertAttribute(attr, className) {
    const { baseType, optional, many } = this.parseType(attr.type);

    const field = {
      name: this.toCamel(attr.name)
    };

    // ENUM
    if (this.enumMap.has(baseType)) {
      field.type = 'enum';
      field.enum = this.enumMap.get(baseType).values;
    }
    // RELATION
    else if (this.classMap.has(baseType)) {
      field.type = baseType;
      field.relation = this.buildRelation(className, baseType, many);
    }
    // PRIMITIVE
    else {
      field.type = this.mapPrimitive(baseType);
    }

    if (optional) {
      field.edit = { optional: true };
    }

    field.view = this.buildView(field);

    if (this.isSearchable(field.name)) {
      field.search = true;
    }

    if (this.isExternalKey(field.name)) {
      field.externalKey = true;
    }

    return field;
  }

  parseType(type) {
    let baseType = type;
    let optional = false;
    let many = false;

    const match = type.match(/^(.+?)\s*\[(.+?)\]$/);
    if (match) {
      baseType = match[1].trim();
      const card = match[2];

      optional = card.startsWith('0');
      many = card.includes('n') || card.includes('*');
    }

    return { baseType, optional, many };
  }

  buildRelation(from, to, many) {
    const rel = this.relations.find(r =>
      (r.from === from && r.to === to) ||
      (r.to === from && r.from === to)
    );

    const relation = {
      kind: many ? 'one-to-many' : 'many-to-one',
      onDelete: 'RESTRICT'
    };

    if (rel?.type === 'composition') {
      relation.embedded = true;
      relation.onDelete = 'CASCADE';
    }

    return relation;
  }

  buildView(field) {
    const view = {};

    if (['code', 'codice', 'nome', 'name'].includes(field.name)) {
      view.list = true;
    }

    view.detail = {
      group: this.inferGroup(field.name),
      component: this.inferComponent(field)
    };

    return view;
  }

  inferComponent(field) {
    if (field.type === 'enum') return 'enum-field';
    if (field.relation) return 'relation-field';

    const map = {
      string: 'string-field',
      number: 'number-field',
      boolean: 'boolean-field',
      date: 'date-field',
      json: 'json-field'
    };

    return map[field.type] || 'string-field';
  }

  inferGroup(name) {
    if (name.includes('descrizione')) return 'textinfo';
    if (name.includes('prezzo') || name.includes('peso')) return 'quantitativeinfo';
    return 'general';
  }

  buildTitle(cls) {
    const code = cls.attributes.find(a =>
      a.name.toLowerCase().includes('codice')
    );
    const name = cls.attributes.find(a =>
      ['nome', 'name', 'descrizione'].includes(a.name.toLowerCase())
    );

    if (code && name) {
      return `{${this.toCamel(code.name)}} - {${this.toCamel(name.name)}}`;
    }

    if (code) {
      return `{${this.toCamel(code.name)}}`;
    }

    return '{id}';
  }

  mapPrimitive(type) {
    const map = {
      String: 'string',
      string: 'string',
      Int: 'number',
      int: 'number',
      Integer: 'number',
      Bool: 'boolean',
      Boolean: 'boolean',
      Date: 'date',
      Json: 'json'
    };
    return map[type] || 'string';
  }

  isExternalKey(name) {
    return name === 'code' || name === 'codice';
  }

  isSearchable(name) {
    return ['nome', 'name', 'descrizione', 'code', 'codice'].includes(name);
  }

  toCamel(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }
}
