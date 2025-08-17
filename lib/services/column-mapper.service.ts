function normalize(col: string): string {
  return col.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

const ALIASES: Record<string, string[]> = {
  investor_name: ['investorname','name','fullname','full_name','investor','investor_name'],
  email: ['email','emailaddress','primaryemail'],
  gross_capital_usd: ['grosscapital','gross','investment','amount','investmentamount','capital'],
  discount_structuring_pct: ['structuringdiscount','structdisc','structuringdiscountpct','discount1'],
  discount_management_pct: ['managementdiscount','mgmtdisc','managementdiscountpct','discount2'],
  discount_admin_pct: ['admindiscount','admindisc','admindiscountpct','discount3'],
  deal_id: ['dealid','code','dealcode'],
  deal_name: ['dealname','name','deal'],
  component: ['component','feecomponent'],
  rate: ['rate','percent','percentage'],
  basis: ['basis','base','feebasis'],
  precedence: ['precedence','order','priority']
};

export class ColumnMapper {
  static mapCSVToSchema(csvColumns: string[], target: 'investors'|'fees'|'transactions') {
    const result: Record<string,string> = {};
    for (const col of csvColumns) {
      const key = normalize(col);
      let mapped = '';
      for (const [canonical, list] of Object.entries(ALIASES)) {
        if (list.includes(key)) { mapped = canonical; break; }
      }
      result[col] = mapped || key;
    }
    return result;
  }
}


