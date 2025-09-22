export interface Lands{
   id:              number;
  assessor_no: number; 
  cadastral_no:  string  ;  
  td_no?:         string  ;
  arp_A?:   string;          
  arp_B?:   string;          
  arp_C?:   string  ;        
  arp_D?:   string   ;       
  arp_E?:   string    ;      
  arp_F?:   string    ;      
  name_owner:   string ;    
  title_no?:   string   ;   
  area?:      string     ;   
  classification_no?: string; 
  improvement_1?:   string  ;
  improvement_2?:   string  ;
  mch?:             string  ;
  oth?:             string  ;

  index_no:         string ;
  barangay:         string ;
  cancel_reason?:   string ;
  cancel_details?:  any ;
  transferred_from?: any ;
  remarks?:          string ;
  changes?:          string ;
}