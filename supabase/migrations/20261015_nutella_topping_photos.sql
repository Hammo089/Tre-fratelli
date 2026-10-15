-- Images only: preserve the restaurant's prices and item restrictions.
update public.extras set image='assets/dessert-real/'||case id
when 'nutella_dark_chips' then 'dark-chips.webp'
when 'nutella_white_chips' then 'white-chips.webp'
when 'nutella_oreo' then 'oreo.webp'
when 'nutella_lotus' then 'lotus.webp'
when 'nutella_white_chocolate' then 'white-chocolate.webp'
end where id in ('nutella_dark_chips','nutella_white_chips','nutella_oreo','nutella_lotus','nutella_white_chocolate');
