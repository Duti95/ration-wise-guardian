import { useState, useEffect } from "react";
import { FileText, Download, Filter, Plus, Save, X, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { reportFilterSchema, transactionMetadataSchema } from "@/lib/validations";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TransactionReport {
  sno: number;
  transaction_date: string;
  vendor_name: string;
  item_name: string;
  purchased_quantity: number;
  purchased_amount: number;
  issued_quantity: number;
  issued_amount: number;
  balance_quantity: number;
  balance_amount: number;
  dep_warden_signature: string;
  principal_signature: string;
  remarks: string;
  item_id: string;
  transaction_id: string;
  transaction_type: string;
}

interface EditingCell {
  rowIndex: number;
  field: keyof TransactionReport;
}

export default function Reports() {
  const [transactions, setTransactions] = useState<TransactionReport[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionReport[]>([]);
  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([]);
  const [filters, setFilters] = useState({
    itemName: "",
    vendorName: "",
    startDate: "",
    endDate: "",
    type: "all"
  });
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
    fetchVendors();

    // Set up real-time subscriptions for all three report tables
    const purchaseChannel = supabase
      .channel('purchase-reports-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchase_transactions_report' },
        () => {
          console.log('Purchase report changed, refreshing...');
          if (filters.type === 'purchase' || filters.type === 'all') {
            fetchTransactions();
          }
        }
      )
      .subscribe();

    const issueChannel = supabase
      .channel('issue-reports-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'issue_transactions_report' },
        () => {
          console.log('Issue report changed, refreshing...');
          if (filters.type === 'issue' || filters.type === 'all') {
            fetchTransactions();
          }
        }
      )
      .subscribe();

    const itemChannel = supabase
      .channel('item-reports-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'item_transaction_report' },
        () => {
          console.log('Item report changed, refreshing...');
          if (filters.type === 'all') {
            fetchTransactions();
          }
        }
      )
      .subscribe();

    const metadataChannel = supabase
      .channel('metadata-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transaction_metadata' },
        () => {
          console.log('Metadata changed, refreshing...');
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(purchaseChannel);
      supabase.removeChannel(issueChannel);
      supabase.removeChannel(itemChannel);
      supabase.removeChannel(metadataChannel);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  useEffect(() => {
    // Re-fetch transactions when type filter changes
    fetchTransactions();
  }, [filters.type]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      let allTransactions: any[] = [];
      
      if (filters.type === 'purchase') {
        // Fetch only purchase transactions
        const { data, error } = await supabase
          .from('purchase_transactions_report')
          .select('*')
          .order('transaction_date', { ascending: false });
        
        if (error) throw error;
        allTransactions = data || [];
        
      } else if (filters.type === 'issue') {
        // Fetch issue transactions
        const { data: issueData, error: issueError } = await supabase
          .from('issue_transactions_report')
          .select('*')
          .order('transaction_date', { ascending: false });
        
        if (issueError) throw issueError;
        
        // For each issued item, find the most recent vendor from purchase history
        const issueTransactionsWithVendor = await Promise.all(
          (issueData || []).map(async (issueTransaction: any) => {
            // Find the most recent purchase for this item
            const { data: purchaseData } = await supabase
              .from('purchase_transactions_report')
              .select('vendor_name')
              .eq('item_id', issueTransaction.item_id)
              .order('transaction_date', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            return {
              ...issueTransaction,
              vendor_name: purchaseData?.vendor_name || issueTransaction.vendor_name || 'N/A'
            };
          })
        );
        
        allTransactions = issueTransactionsWithVendor;
        
      } else {
        // Fetch both purchase and issue transactions for "All" filter
        const [purchaseResult, issueResult] = await Promise.all([
          supabase
            .from('purchase_transactions_report')
            .select('*'),
          supabase
            .from('issue_transactions_report')
            .select('*')
        ]);
        
        if (purchaseResult.error) throw purchaseResult.error;
        if (issueResult.error) throw issueResult.error;
        
        // For issue transactions, populate vendor names from purchase history
        const issueTransactionsWithVendor = await Promise.all(
          (issueResult.data || []).map(async (issueTransaction: any) => {
            const { data: purchaseData } = await supabase
              .from('purchase_transactions_report')
              .select('vendor_name')
              .eq('item_id', issueTransaction.item_id)
              .order('transaction_date', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            return {
              ...issueTransaction,
              vendor_name: purchaseData?.vendor_name || issueTransaction.vendor_name || 'N/A'
            };
          })
        );
        
        // Combine both arrays and sort by date
        allTransactions = [...(purchaseResult.data || []), ...issueTransactionsWithVendor]
          .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
      }

      // Fetch metadata for signatures and remarks
      const { data: metadata, error: metadataError } = await supabase
        .from('transaction_metadata')
        .select('*');

      if (metadataError) throw metadataError;

      // Merge metadata with transactions
      const mergedData = allTransactions.map((transaction: any) => {
        const meta = metadata?.find(
          m => m.transaction_id === transaction.transaction_id && 
               m.item_id === transaction.item_id &&
               m.transaction_type === transaction.transaction_type
        );
        
        return {
          ...transaction,
          dep_warden_signature: meta?.dep_warden_signature || '',
          principal_signature: meta?.principal_signature || '',
          remarks: meta?.remarks || '',
          balance_quantity: meta?.custom_balance_quantity || transaction.balance_quantity,
          balance_amount: meta?.custom_balance_amount || transaction.balance_amount,
        };
      });

      // Remove duplicates based on unique combination
      const uniqueTransactions = mergedData.filter((transaction, index, self) =>
        index === self.findIndex((t) => (
          t.transaction_id === transaction.transaction_id &&
          t.item_id === transaction.item_id &&
          t.transaction_type === transaction.transaction_type
        ))
      );

      setTransactions(uniqueTransactions);
      setFilteredTransactions(uniqueTransactions);
    } catch (error: any) {
      toast({
        title: "Error loading transactions",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.itemName) {
      filtered = filtered.filter(t => 
        t.item_name.toLowerCase().includes(filters.itemName.toLowerCase())
      );
    }

    if (filters.vendorName && filters.vendorName !== "all") {
      filtered = filtered.filter(t => 
        t.vendor_name?.toLowerCase() === filters.vendorName.toLowerCase()
      );
    }

    // Type filtering is now handled by querying the appropriate view
    // So we don't need to filter by type here anymore

    if (filters.startDate) {
      filtered = filtered.filter(t => 
        new Date(t.transaction_date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(t => 
        new Date(t.transaction_date) <= new Date(filters.endDate)
      );
    }

    setFilteredTransactions(filtered);
  };

  const startEditing = (rowIndex: number, field: keyof TransactionReport) => {
    if (field === 'sno') return; // Cannot edit Sno
    setEditingCell({ rowIndex, field });
    setEditValue(String(filteredTransactions[rowIndex][field] || ''));
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveEdit = async (rowIndex: number, field: keyof TransactionReport) => {
    const transaction = filteredTransactions[rowIndex];
    const newValue = editValue;

    try {
      // Validate metadata fields
      const metadataFields = ['dep_warden_signature', 'principal_signature', 'remarks', 'balance_quantity', 'balance_amount'];
      
      if (metadataFields.includes(field)) {
        // Validate using Zod schema
        try {
          const validationData: any = {};
          if (field === 'balance_quantity') {
            validationData.custom_balance_quantity = parseFloat(newValue) || 0;
          } else if (field === 'balance_amount') {
            validationData.custom_balance_amount = parseFloat(newValue) || 0;
          } else if (field === 'dep_warden_signature') {
            validationData.dep_warden_signature = newValue;
          } else if (field === 'principal_signature') {
            validationData.principal_signature = newValue;
          } else if (field === 'remarks') {
            validationData.remarks = newValue;
          }
          
          transactionMetadataSchema.parse(validationData);
        } catch (validationError: any) {
          toast({
            title: "Validation Error",
            description: validationError.errors?.[0]?.message || "Invalid input value",
            variant: "destructive"
          });
          return;
        }

        // Upsert to transaction_metadata
        const metadataUpdate: any = {
          transaction_id: transaction.transaction_id,
          transaction_type: transaction.transaction_type,
          item_id: transaction.item_id,
        };

        if (field === 'balance_quantity') {
          metadataUpdate.custom_balance_quantity = parseFloat(newValue) || 0;
        } else if (field === 'balance_amount') {
          metadataUpdate.custom_balance_amount = parseFloat(newValue) || 0;
        } else {
          metadataUpdate[field] = newValue;
        }

        const { error } = await supabase
          .from('transaction_metadata')
          .upsert(metadataUpdate, {
            onConflict: 'transaction_id,transaction_type,item_id'
          });

        if (error) throw error;
      } else {
        // Validate numeric fields
        const numericValue = parseFloat(newValue);
        if (isNaN(numericValue) || numericValue < 0) {
          toast({
            title: "Validation Error",
            description: "Value must be a positive number",
            variant: "destructive"
          });
          return;
        }

        // Update the actual transaction table (purchases/stock_issues)
        if (transaction.transaction_type === 'purchase') {
          // Update purchase_items
          const updateData: any = {};
          if (field === 'purchased_quantity') {
            updateData.quantity = parseFloat(newValue) || 0;
            // Recalculate total_price
            const item = filteredTransactions[rowIndex];
            updateData.total_price = updateData.quantity * (item.purchased_amount / item.purchased_quantity);
          } else if (field === 'purchased_amount') {
            updateData.total_price = parseFloat(newValue) || 0;
          }

          if (Object.keys(updateData).length > 0) {
            const { error } = await supabase
              .from('purchase_items')
              .update(updateData)
              .eq('purchase_id', transaction.transaction_id)
              .eq('item_id', transaction.item_id);

            if (error) throw error;
          }
        } else if (transaction.transaction_type === 'issue') {
          // Update stock_issue_items
          const updateData: any = {};
          if (field === 'issued_quantity') {
            updateData.quantity = parseFloat(newValue) || 0;
            const item = filteredTransactions[rowIndex];
            updateData.total_price = updateData.quantity * (item.issued_amount / item.issued_quantity);
          } else if (field === 'issued_amount') {
            updateData.total_price = parseFloat(newValue) || 0;
          }

          if (Object.keys(updateData).length > 0) {
            const { error } = await supabase
              .from('stock_issue_items')
              .update(updateData)
              .eq('issue_id', transaction.transaction_id)
              .eq('item_id', transaction.item_id);

            if (error) throw error;
          }
        }
      }

      toast({
        title: "Updated successfully",
        description: `${field} has been updated.`,
      });

      await fetchTransactions(); // Refresh data
      cancelEditing();
    } catch (error: any) {
      toast({
        title: "Error updating",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const exportToExcel = () => {
    const exportData = filteredTransactions.map((t, index) => ({
      'S.No': index + 1,
      'Date': new Date(t.transaction_date).toLocaleDateString('en-IN'),
      'Vendor Name': t.vendor_name || 'N/A',
      'Item Name': t.item_name,
      'Purchased Qty': t.purchased_quantity,
      'Purchased Amount': t.purchased_amount,
      'Issued Qty': t.issued_quantity,
      'Issued Amount': t.issued_amount,
      'Balance Qty': t.balance_quantity,
      'Balance Amount': t.balance_amount,
      'Dep. Warden Signature': t.dep_warden_signature,
      'Principal Signature': t.principal_signature,
      'Remarks': t.remarks
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transaction Report");
    XLSX.writeFile(wb, `Transaction_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: "Export successful",
      description: "Excel file has been downloaded.",
    });
  };

  const exportToCSV = () => {
    const exportData = filteredTransactions.map((t, index) => ({
      'S.No': index + 1,
      'Date': new Date(t.transaction_date).toLocaleDateString('en-IN'),
      'Vendor Name': t.vendor_name || 'N/A',
      'Item Name': t.item_name,
      'Purchased Qty': t.purchased_quantity,
      'Purchased Amount': t.purchased_amount,
      'Issued Qty': t.issued_quantity,
      'Issued Amount': t.issued_amount,
      'Balance Qty': t.balance_quantity,
      'Balance Amount': t.balance_amount,
      'Dep. Warden Signature': t.dep_warden_signature,
      'Principal Signature': t.principal_signature,
      'Remarks': t.remarks
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transaction_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: "Export successful",
      description: "CSV file has been downloaded.",
    });
  };

  const renderCell = (transaction: TransactionReport, field: keyof TransactionReport, rowIndex: number) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === field;
    const value = transaction[field];

    if (field === 'sno') {
      return <span className="font-medium">{rowIndex + 1}</span>;
    }

    if (field === 'transaction_date') {
      if (isEditing) {
        return (
          <div className="flex gap-1">
            <Input
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8 text-xs"
            />
            <Button size="sm" onClick={() => saveEdit(rowIndex, field)} className="h-8 w-8 p-0">
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-8 w-8 p-0">
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }
      return (
        <div className="flex items-center justify-between group cursor-pointer" onClick={() => startEditing(rowIndex, field)}>
          <span>{new Date(value as string).toLocaleDateString('en-IN')}</span>
          <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100" />
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="flex gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 text-xs"
            type={typeof value === 'number' ? 'number' : 'text'}
            step={typeof value === 'number' ? '0.01' : undefined}
          />
          <Button size="sm" onClick={() => saveEdit(rowIndex, field)} className="h-8 w-8 p-0">
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-8 w-8 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between group cursor-pointer" onClick={() => startEditing(rowIndex, field)}>
        <span className={typeof value === 'number' ? 'font-mono' : ''}>
          {typeof value === 'number' ? (field.includes('amount') ? `₹${value.toFixed(2)}` : value.toFixed(2)) : (value || '-')}
        </span>
        <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100" />
      </div>
    );
  };

  const totalPurchaseAmount = filteredTransactions.reduce((sum, t) => sum + (t.purchased_amount || 0), 0);
  const totalIssueAmount = filteredTransactions.reduce((sum, t) => sum + (t.issued_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Item-wise Transaction Report</h1>
          <p className="text-muted-foreground">View and manage all inventory transactions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchase Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{totalPurchaseAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Issue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹{totalIssueAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input
                placeholder="Filter by item"
                value={filters.itemName}
                onChange={(e) => setFilters(prev => ({ ...prev, itemName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Vendor Name</Label>
              <Select
                value={filters.vendorName}
                onValueChange={(value) => setFilters(prev => ({ ...prev, vendorName: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.name}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="purchase">Purchased</SelectItem>
                  <SelectItem value="issue">Issued</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <Button onClick={() => setFilters({ itemName: "", vendorName: "all", startDate: "", endDate: "", type: "all" })} variant="outline">
              Clear Filters
            </Button>
            <Button onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Transactions ({filteredTransactions.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">S.No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Purchased Qty</TableHead>
                  <TableHead>PQ Amount</TableHead>
                  <TableHead>Issued Qty</TableHead>
                  <TableHead>Issued Amount</TableHead>
                  <TableHead>Balance Qty</TableHead>
                  <TableHead>Balance Amount</TableHead>
                  <TableHead>Dep. Warden Sign</TableHead>
                  <TableHead>Principal Sign</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                   </TableRow>
                ) : (
                  filteredTransactions.map((transaction, index) => (
                    <TableRow key={`${transaction.transaction_id}-${transaction.item_id}-${transaction.transaction_type}`}>
                      <TableCell>{renderCell(transaction, 'sno', index)}</TableCell>
                      <TableCell>{renderCell(transaction, 'transaction_date', index)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.transaction_type === 'purchase' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {transaction.transaction_type === 'purchase' ? 'Purchased' : 'Issued'}
                        </span>
                      </TableCell>
                      <TableCell>{renderCell(transaction, 'vendor_name', index)}</TableCell>
                      <TableCell>{renderCell(transaction, 'item_name', index)}</TableCell>
                      <TableCell>{renderCell(transaction, 'purchased_quantity', index)}</TableCell>
                      <TableCell>{renderCell(transaction, 'purchased_amount', index)}</TableCell>
                      <TableCell>{renderCell(transaction, 'issued_quantity', index)}</TableCell>
                      <TableCell>{renderCell(transaction, 'issued_amount', index)}</TableCell>
                      <TableCell>{renderCell(transaction, 'balance_quantity', index)}</TableCell>
                      <TableCell>{renderCell(transaction, 'balance_amount', index)}</TableCell>
                      <TableCell>{renderCell(transaction, 'dep_warden_signature', index)}</TableCell>
                      <TableCell>{renderCell(transaction, 'principal_signature', index)}</TableCell>
                      <TableCell>{renderCell(transaction, 'remarks', index)}</TableCell>
                    </TableRow>
                   ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
